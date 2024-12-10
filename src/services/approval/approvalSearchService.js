import API from "../interceptor";

class ApprovalSearchService {
  async getApprovalList(params) {
    try {
      const response = await API.post("/api/Approve/ApproveResult", params);
      return response;
    } catch (error) {
      console.error(error);
    }
  }
}

export default new ApprovalSearchService();
