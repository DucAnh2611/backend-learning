import { Router } from 'express';

import { authRouter } from '@/modules/auth';

import { appsRouter } from '@/modules/apps';

import { rbacRouter } from '@/modules/rbac';

const router = Router();

router.use('/auth', authRouter);

router.use('/apps', appsRouter);

router.use('/', rbacRouter);

export { router };
