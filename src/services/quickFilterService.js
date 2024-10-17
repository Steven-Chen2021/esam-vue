import API from "./interceptor";

class QuickFilterService {
  async getQuickFilterColumnList(requestType) {
    try {
      const url = `/api/Common/QuickFilterColumnList?requestType=${requestType}`;
      const response = await API.get(url);
      return response.returnValue;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async getCustomizeQuickFilterSetting(requestType) {
    try {
      const url = `/api/Common/CustomizeQuickFilterSetting?filterAppliedPage=${requestType}`;
      const response = await API.get(url);
      return response.returnValue;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async getColumnSetting(requestType) {
    try {
      const url = `/api/Common/ColumnSetting?APIRequestType=${requestType}`;
      const response = await API.get(url);
      return response.returnValue;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
}

export default new QuickFilterService();
