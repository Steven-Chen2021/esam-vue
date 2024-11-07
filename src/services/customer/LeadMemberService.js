import API from "../interceptor";

class LeadMemberService {
  async getLeadMembersResult(CustPLid) {
    try {
      const url = `/api/LeadMember/GetLeadMembersResult?CustPLid=${CustPLid}`;
      const response = await API.get(url);
      console.log("getLeadMembersResult response", response);
      return response;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
  async getLeadMemberListResult(CustPLid) {
    try {
      const url = `/api/LeadMember/GetLeadMemberListResult?CustPLid=${CustPLid}`;
      const response = await API.get(url);
      console.log("GetLeadMemberListResult response", response);
      return response;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
  async getUserListbyMemberResult(params) {
    try {
      const url = "/api/LeadMember/GetUserListbyMemberResult";
      const queryString = new URLSearchParams(params).toString();
      const fullUrl = `${url}?${queryString}`;
      const response = await API.get(fullUrl);
      return response;
    } catch (error) {
      console.error(error);
    }
  }
  async saveLeadMemberResult(params) {
    try {
      const response = await API.post(
        `/api/LeadMember/SaveLeadMemberResult?CustPLid=${params.CustPLid}`,
        params.UserList
      );
      return response;
    } catch (error) {
      console.error(error);
    }
  }
  async removeLeadMemberResult(params) {
    try {
      const response = await API.post(
        `/api/LeadMember/RemoveLeadMemberResult?CustPLid=${params.CustPLid}`,
        params.UserList
      );
      return response;
    } catch (error) {
      console.error(error);
    }
  }
}

export default new LeadMemberService();
