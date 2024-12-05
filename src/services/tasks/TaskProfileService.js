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
  async inactiveContactResult(contactID) {
    try {
      const response = await API.post(
        `/api/Contact/InactiveContactResult?ContactID=${contactID}`
      );
      return response;
    } catch (error) {
      console.error(error);
    }
  }
  async activeContactResult(contactID) {
    try {
      const response = await API.post(
        `/api/Contact/ActiveContactResult?ContactID=${contactID}`
      );
      return response;
    } catch (error) {
      console.error(error);
    }
  }
  async updateContactProfile(params) {
    try {
      const response = await API.post(
        "/api/Contact/UpdateContactProfileResult",
        params
      );
      return response;
    } catch (error) {
      console.error(error);
    }
  }
  async updateContactProfilePLResult(params) {
    try {
      const response = await API.post(
        "/api/Contact/UpdateContactProfilePLResult",
        params
      );
      return response;
    } catch (error) {
      console.error(error);
    }
  }
}

export default new TaskProfileService();
