import { Router } from 'express';

const router = Router();

// Placeholder treatments route
router.get('/', (req, res) => res.json({ message: 'treatments route' }));

export default router;
