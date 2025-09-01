import Settings from "../../common/Settings";
import OpenAI from "../../backend/ai/OpenAI";

/** Test */
OpenAI.Predict(Settings.FINGERPRINT, Settings.Soudure).then((ai_digest) => console.log(`\x1b[33m\t\t🔍 ${JSON.stringify(ai_digest)}\x1b[0m`));
