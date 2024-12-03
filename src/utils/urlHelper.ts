import { useI18n } from "vue-i18n";

export function UrlHelper() {
  const { t } = useI18n();

  const ReconstructDCURL = (
    originalUrl: string,
    isWrite: boolean,
    isReadAdvanceColumn: boolean,
    requestTypeCode: string
  ) => {
    const [base, hashPart] = originalUrl.split("#");
    const params = new URLSearchParams(hashPart.split("?")[1]);
    if (isReadAdvanceColumn === false) {
      return t("common.unauthorized");
    } else {
      if (isWrite === false) {
        params.set("BSDOC", "0");
        params.set("BADEL", "0");
        params.set("BAUPL", "0");
        return `${base}#${hashPart.split("?")[0]}?${params.toString()}`;
      } else {
        params.set("BSDOC", requestTypeCode === "NRA" ? "0" : "1");
        params.set("BADEL", "1");
        params.set("BAUPL", "1");
        return `${base}#${hashPart.split("?")[0]}?${params.toString()}`;
      }
    }
  };
  return { ReconstructDCURL };
}
