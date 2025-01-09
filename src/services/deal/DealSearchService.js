import API from "../interceptor";

class DealSearchService {
  async getDealList(params) {
    try {
      const response = await API.post("/api/Deal/DealSearch", params);
      return response;
    } catch (error) {
      console.error(error);
    }
  }
}

export default new DealSearchService();
