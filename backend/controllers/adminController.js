import pino from 'pino';
import Report from '../models/Report.js';
import Treatment from '../models/Treatment.js';

const logger = pino();

const getAllReports = async (req, res) => {
	try {
		const page = parseInt(req.query.page, 10) || 1;
		const limit = parseInt(req.query.limit, 10) || 20;
		const skip = (page - 1) * limit;

		const query = { deleted: false };
		const [reports, total] = await Promise.all([
			Report.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
			Report.countDocuments(query)
		]);

		return res.json({ data: reports, meta: { total, page, limit } });
	} catch (error) {
		logger.error('getAllReports error:', error);
		return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch reports' } });
	}
};

const upsertTreatment = async (req, res) => {
	try {
		const payload = req.body;
		if (payload.id) {
			const updated = await Treatment.findByIdAndUpdate(payload.id, payload, { new: true, runValidators: true });
			return res.json({ data: updated });
		}

		const treatment = new Treatment(payload);
		const saved = await treatment.save();
		return res.status(201).json({ data: saved });
	} catch (error) {
		logger.error('upsertTreatment error:', error);
		return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to upsert treatment' } });
	}
};

const deleteTreatment = async (req, res) => {
	try {
		const { id } = req.params;
		await Treatment.findByIdAndDelete(id);
		return res.status(204).send();
	} catch (error) {
		logger.error('deleteTreatment error:', error);
		return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to delete treatment' } });
	}
};

export { getAllReports, upsertTreatment, deleteTreatment };

