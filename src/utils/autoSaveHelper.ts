import commonService from "@/services/commonService";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import { ref } from "vue";

export function AutoSaveHelper() {
  const { t } = useI18n();
  interface iAutoSave {
    TableName: string | null;
    TableName2: string | null;
    FieldName: string | null;
    Id: number;
    CustID: string;
    OldValue: string | null;
    Value: number | null;
    OldEntity: number | null;
    NewEntity: string | null;
  }

  const AutoSaveItem = ref<iAutoSave>({
    TableName: null,
    TableName2: null,
    FieldName: null,
    Id: 0,
    CustID: "",
    OldValue: null,
    Value: null,
    OldEntity: null,
    NewEntity: null
  });

  async function AutoSave(params: any) {
    try {
      commonService
        .autoSave(params)
        .then(d => {
          console.log("autosave data", d);
          ElMessage({
            message: t("customer.profile.autoSaveSucAlert"),
            grouping: true,
            type: "success"
          });
        })
        .catch(err => {
          console.log("autosave error", err);
          ElMessage({
            message: t("customer.profile.autoSaveFailAlert"),
            grouping: true,
            type: "warning"
          });
        });
    } catch (error) {
      console.error("autoSaveHelper Error:", error);
    }
  }
  return { AutoSaveItem, AutoSave };
}
