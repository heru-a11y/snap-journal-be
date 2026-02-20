import express from "express";
import { authMiddleware } from "../middlewares/auth-middleware.js";
import { runValidation } from "../middlewares/validation-middleware.js";
import { 
    createJournalValidation, 
    updateJournalValidation, 
    favoriteJournalValidation,
    draftJournalValidation
} from "../validations/journal-validation.js";
import { multipartMiddleware } from "../middlewares/multipart-middleware.js";
import journalController from "../controllers/journal-controller.js";

const journalRouter = new express.Router();

journalRouter.use(authMiddleware);

journalRouter.post('/api/v1/journals', 
    multipartMiddleware,
    runValidation(createJournalValidation),
    journalController.createJournal
);

journalRouter.post('/api/v1/journals/draft', 
    multipartMiddleware,
    journalController.createJournalDraft
);

journalRouter.get('/api/v1/journals', 
    journalController.listJournal
);

journalRouter.get('/api/v1/journals/draft',
    journalController.getDraftJournal
);

journalRouter.get('/api/v1/journals/favorite',
    journalController.getFavoriteJournal
);

journalRouter.get('/api/v1/journals/latest',
    journalController.getLatestJournal
);

journalRouter.get('/api/v1/journals/daily-insight', 
    journalController.getDailyInsight
);

journalRouter.get('/api/v1/journals/mood-calendar', 
    journalController.getMoodCalendar
);

journalRouter.post('/api/v1/journals/editor-image',
    multipartMiddleware,
    journalController.uploadEditorImage
);

journalRouter.delete('/api/v1/journals/editor-image',
    journalController.deleteEditorImage
);

journalRouter.get('/api/v1/journals/:id', 
    journalController.getDetailJournal
);

journalRouter.put('/api/v1/journals/:id', 
    multipartMiddleware,
    runValidation(updateJournalValidation),
    journalController.updateJournal
);

journalRouter.patch('/api/v1/journals/:id/favorite',
    runValidation(favoriteJournalValidation),
    journalController.toggleFavorite
);

journalRouter.patch('/api/v1/journals/:id/draft',
    runValidation(draftJournalValidation),
    journalController.toggleDraft
);

journalRouter.post('/api/v1/journals/enhance', 
    journalController.enhanceText
);

journalRouter.post('/api/v1/journals/:id/chat', 
    journalController.chat
);

journalRouter.post('/api/v1/journals/:id/analyze', 
    journalController.analyze
);

journalRouter.delete('/api/v1/journals/:id', 
    journalController.deleteJournal
);

export { journalRouter };