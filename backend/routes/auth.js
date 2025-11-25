import { Router } from 'express';

const router = Router();

// Basic placeholder auth routes
router.get('/', (req, res) => res.json({ message: 'auth route' }));

export default router;
