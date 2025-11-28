import { Router } from 'express';

const router = Router();

// Placeholder reports route
router.get('/', (req, res) => res.json({ message: 'reports route' }));

export default router;
