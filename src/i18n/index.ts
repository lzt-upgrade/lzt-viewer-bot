import { env } from "../env";
import en from "./en";
import ru from "./ru";

export default env.LOCALE === "ru" ? ru : en;
