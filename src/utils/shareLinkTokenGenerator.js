import { customAlphabet } from "nanoid";
import { SHARE_TYPE } from "../constants/sharelinks-constants.js";

const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 10);

const PREFIX = {
    [SHARE_TYPE.PUBLIC]: "pub",
    [SHARE_TYPE.RESTRICTED]: "res"
};

export const generateShareToken = (shareType) => {
    const prefix = PREFIX[shareType];

    if (!prefix) {
        throw new Error("Invalid share type");
    }

    return `${prefix}_${nanoid()}`;
};