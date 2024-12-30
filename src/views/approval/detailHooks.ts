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

  async function getApproveChargeDataResult(AID) {
    try {
      const response = await ApprovalSearchService.getApproveChargeData(AID);
      return response;
    } catch (error) {
      console.log("getApproveUserResult", error);
    }
  }

  async function sendApproveResult(params) {
    try {
      const response = await ApprovalSearchService.sendApprove(params);
      return response;
    } catch (error) {
      console.log("getApproveUserResult", error);
    }
  }

  return {
    getApproveHeaderResult,
    getApproveUserResult,
    getApproveChargeDataResult,
    sendApproveResult
  };
}
