import API from "../interceptor";

class DealProfileService {
  async getDealProfileResult(DealID) {
    try {
      const url = `/api/Deal/DealResult?DealID=${DealID}`;
      const response = await API.get(url);
      return response;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
  async getDealDetailsResult(DealID) {
    try {
      const url = `/api/Deal/DealDetailsResult?DealID=${DealID}`;
      const response = await API.get(url);
      return response;
    } catch (error) {
      console.error(error);
    }
  }
  async getDealTodolistResult(DealID) {
    try {
      const url = `/api/Deal/DealTodolistResult?DealID=${DealID}`;
      const response = await API.get(url);
      return response;
    } catch (error) {
      console.error(error);
    }
  }
  async getLinkedTaskDataList(params) {
    try {
      const response = await API.post(
        "/api/Deal/GetLinkedTaskDataList",
        params
      );
      return response;
    } catch (error) {
      console.error(error);
    }
  }
  async getLinkedContactDataList(params) {
    try {
      const response = await API.post(
        "/api/Deal/GetLinkedContactDataList",
        params
      );
      return response;
    } catch (error) {
      console.error(error);
    }
  }
  async getLinkedQuoteDataList(params) {
    try {
      const response = await API.post(
        "/api/Deal/GetLinkedQuoteDataList",
        params
      );
      return response;
    } catch (error) {
      console.error(error);
    }
  }
  async updateLinkData(params) {
    try {
      const response = await API.post("/api/Deal/UpdateLinkData", params);
      return response;
    } catch (error) {
      console.error(error);
    }
  }
}

export default new DealProfileService();
