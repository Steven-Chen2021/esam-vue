import API from "./interceptor";

class CustomerQuickFilterService {
  async getStatusList(url) {
    try {
      const response = await API.get(url);
      return response;
    } catch (error) {
      console.error(error);
    }
  }
  async getAutoCompleteList(params) {
    try {
      const url = "/api/Common/OptionsResource";
      const queryString = new URLSearchParams(params).toString();
      const fullUrl = `${url}?${queryString}`;
      const response = await API.get(fullUrl);
      return response.returnValue;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
  async getDropdownList(Url) {
    try {
      const response = await API.get(Url);
      return response.returnValue;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
  async updateQuickFilter(params) {
    try {
      const response = await API.put(
        "/api/Common/CustomizeQuickFilterSetting",
        params
      );
      return response;
    } catch (error) {
      console.error(error);
    }
  }
  async addQuickFilter(params) {
    try {
      const response = await API.post(
        "/api/Common/CustomizeQuickFilterSetting",
        params
      );
      return response;
    } catch (error) {
      console.error(error);
    }
  }
  async deleteQuickFilter(params) {
    try {
      const url = "/api/Common/CustomizeQuickFilterSetting";
      const queryString = new URLSearchParams(params).toString();
      const fullUrl = `${url}?${queryString}`;
      const response = await API.delete(fullUrl);
      return response;
    } catch (error) {
      console.error(error);
    }
  }
  async getAdvancedFilterSetting(requestTypeID) {
    try {
      const response = await API.get(
        `/api/Common/ColumnSetting?APIRequestType=${requestTypeID}`
      );
      return response;
    } catch (error) {
      console.error(error);
    }
  }
  // async getAdvancedFilterSettingByRequestType(requestTypeID) {
  //   try {
  //     const response = await API.get(
  //       `/api/Common/ColumnSetting?APIRequestType=${requestTypeID}`
  //     );
  //     return response;
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }
  async updateAdvancedFilter(params) {
    try {
      const response = await API.post("/api/Common/ColumnSetting", params);
      return response;
    } catch (error) {
      console.error(error);
    }
  }
  async getResult(url) {
    try {
      const response = await API.get(url);
      return response;
    } catch (error) {
      console.error(error);
    }
  }

  async getHistoryResult(params) {
    try {
      const url = "/api/Common/HistoryResult";
      const queryString = new URLSearchParams(params).toString();
      const fullUrl = `${url}?${queryString}`;
      const response = await API.get(fullUrl);
      return response.returnValue;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
  async autoSave(params) {
    try {
      const response = await API.post("/api/AutoSave/AutoSave", params);
      return response;
    } catch (error) {
      console.error(error);
    }
  }
}

export default new CustomerQuickFilterService();
