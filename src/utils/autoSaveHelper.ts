import commonService from "@/services/commonService";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import { ref } from "vue";

export function AutoSaveHelper() {
  const { t } = useI18n();
  interface iAutoSave {
    tableName: string | null;
    fieldName: string | null;
    id: number;
    custID: string;
    oldValue: string | null;
    value: number | null;
    oldEntity: number | null;
    newEntity: string | null;
  }

  const AutoSaveItem = ref<iAutoSave>({
    tableName: null,
    fieldName: null,
    id: 0,
    custID: "",
    oldValue: null,
    value: null,
    oldEntity: null,
    newEntity: null
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
