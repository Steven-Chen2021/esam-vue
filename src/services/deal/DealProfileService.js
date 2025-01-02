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
}

export default new DealProfileService();
