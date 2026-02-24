import express from "express";
import { authMiddleware } from "../middlewares/auth-middleware.js";
import { runValidation } from "../middlewares/validation-middleware.js";
import { 
    searchJournalValidation,
    createJournalValidation, 
    updateJournalValidation, 
    favoriteJournalValidation,
    draftJournalValidation
} from "../validations/journal-validation.js";
import { multipartMiddleware } from "../middlewares/multipart-middleware.js";
import journalController from "../controllers/journal-controller.js";

const journalRouter = new express.Router();

journalRouter.use(authMiddleware);

journalRouter.post('/journals', 
    multipartMiddleware,
    runValidation(createJournalValidation),
    journalController.createJournal
);

journalRouter.post('/journals/draft', 
    multipartMiddleware,
    journalController.createJournalDraft
);

journalRouter.get('/journals', 
    journalController.listJournal
);

journalRouter.get('/journals/search',
    runValidation(searchJournalValidation),
    journalController.searchJournal
);

journalRouter.get('/journals/draft',
    journalController.getDraftJournal
);

journalRouter.get('/journals/favorite',
    journalController.getFavoriteJournal
);

journalRouter.get('/journals/latest',
    journalController.getLatestJournal
);

journalRouter.get('/journals/daily-insight', 
    journalController.getDailyInsight
);

journalRouter.get('/journals/periodic-insight', 
    journalController.getPeriodicInsight
);

journalRouter.get('/journals/top-mood', 
    journalController.getTopMood
)

journalRouter.get('/journals/mood-calendar', 
    journalController.getMoodCalendar
);

journalRouter.post('/journals/enhance', 
    journalController.enhanceText
);

journalRouter.get('/journals/:id', 
    journalController.getDetailJournal
);

journalRouter.put('/journals/:id', 
    multipartMiddleware,
    runValidation(updateJournalValidation),
    journalController.updateJournal
);

journalRouter.patch('/journals/:id/favorite',
    runValidation(favoriteJournalValidation),
    journalController.toggleFavorite
);

journalRouter.patch('/journals/:id/draft',
    runValidation(draftJournalValidation),
    journalController.toggleDraft
);

journalRouter.post('/journals/:id/chat', 
    journalController.chat
);

journalRouter.post('/journals/:id/analyze', 
    journalController.analyze
);

journalRouter.delete('/journals/:id', 
    journalController.deleteJournal
);

journalRouter.post('/media/editor-image',
    multipartMiddleware,
    journalController.uploadJournalImage
);

journalRouter.delete('/media/editor-image',
    journalController.deleteJournalImage
);

export { journalRouter };