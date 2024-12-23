import ApprovalSearchService from "@/services/approval/approvalSearchService";

export function ApprovalDetailHooks() {
  async function getApproveHeaderResult(AID) {
    try {
      const response = await ApprovalSearchService.getApproveHeader(AID);
      return response;
    } catch (error) {
      console.log("getApproveHeaderResult", error);
    }
  }

  async function getApproveUserResult(AID) {
    try {
      const response = await ApprovalSearchService.getApproveUser(AID);
      return response;
    } catch (error) {
      console.log("getApproveUserResult", error);
    }
  }

  return {
    getApproveHeaderResult,
    getApproveUserResult
  };
}
