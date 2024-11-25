import API from "../interceptor";

class TaskSearchService {
  async getTaskList(params) {
    try {
      const response = await API.post("/api/Task/TaskResult", params);
      return response;
    } catch (error) {
      console.error(error);
    }
  }
}

export default new TaskSearchService();
