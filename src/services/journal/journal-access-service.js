import journalRepository from "../../repositories/journal-repository.js";
import { ResponseError } from "../../error/response-error.js";
import { JOURNAL_MESSAGES } from "../../constants/journal-constant.js";

const checkAccess = async (userId, journalId, lang = 'id') => {
    const data = await journalRepository.findById(journalId);
    
    if (!data) throw new ResponseError(404, JOURNAL_MESSAGES[lang].NOT_FOUND);
    if (data.user_id !== userId) throw new ResponseError(403, JOURNAL_MESSAGES[lang].FORBIDDEN);
    
    return data;
};

export default { checkAccess };