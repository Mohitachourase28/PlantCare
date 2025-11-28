import { Router } from 'express';

const router = Router();

// Placeholder feedback route
router.get('/', (req, res) => res.json({ message: 'feedback route' }));

export default router;
