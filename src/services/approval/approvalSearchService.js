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

  async getApproveUser(AID) {
    try {
      const url = "/api/Approve/ApproveUserResult";
      const fullUrl = `${url}?ApproveID=${AID}`;
      const response = await API.get(fullUrl);
      return response;
    } catch (error) {
      console.error(error);
    }
  }

  async getApproveHeader(AID) {
    try {
      const url = "/api/Approve/ApproveHeaderResult";
      const fullUrl = `${url}?ApproveID=${AID}`;
      const response = await API.get(fullUrl);
      return response;
    } catch (error) {
      console.error(error);
    }
  }

  async getApproveChargeData(AID) {
    try {
      const url = "/api/Approve/ApproveQuoteFreightLocalChargeResult";
      const fullUrl = `${url}?ApproveID=${AID}`;
      const response = await API.get(fullUrl);
      return response;
    } catch (error) {
      console.error(error);
    }
  }
}

export default new ApprovalSearchService();
