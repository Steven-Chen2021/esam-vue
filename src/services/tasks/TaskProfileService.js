import API from "../interceptor";

class TaskProfileService {
  async getTaskProfileResult(TaskID, CustomerHQID) {
    try {
      const url = `/api/Task/TaskDetailResult?TaskID=${TaskID}&CustomerHQID=${CustomerHQID}`;
      const response = await API.get(url);
      return response;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
  async updateTaskProfile(params) {
    try {
      const response = await API.post("/api/Task/SaveTaskInfoResult", params);
      return response;
    } catch (error) {
      console.error(error);
    }
  }
  async getNotifyData(params) {
    try {
      const response = await API.post("/api/Task/SaveTaskInfoResult", params);
      return response;
    } catch (error) {
      console.error(error);
    }
  }
}

export default new TaskProfileService();
