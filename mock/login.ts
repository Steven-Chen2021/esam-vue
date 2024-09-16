// 根据角色动态生成路由
import { defineFakeRoute } from "vite-plugin-fake-server/client";

export default defineFakeRoute([
  {
    url: "/login",
    method: "post",
    response: ({ body }) => {
      if (body.username === "admin") {
        return {
          success: true,
          data: {
            avatar:
              "https://eHRTest.dimerco.com:9104/hr/Internal/UserHandler.ashx?Type=UserPhoto&UserID=A1231",
            username: "admin",
            nickname: "Steven Chen",
            // 一个用户可能有多个角色
            roles: ["admin"],
            accessToken: "eyJhbGciOiJIUzUxMiJ9.admin",
            refreshToken: "eyJhbGciOiJIUzUxMiJ9.adminRefresh",
            expires: "2030/10/30 00:00:00"
          }
        };
      } else if (body.username.toUpperCase() === "B1231") {
        return {
          success: true,
          data: {
            avatar: "https://avatars.githubusercontent.com/u/44761321",
            username: "B1231",
            nickname: "Steven Chen(B1231)",
            // 一个用户可能有多个角色
            roles: ["admin"],
            accessToken: "eyJhbGciOiJIUzUxMiJ9.admin",
            refreshToken: "eyJhbGciOiJIUzUxMiJ9.adminRefresh",
            expires: "2030/10/30 00:00:00"
          }
        };
      } else if (body.username.toUpperCase() === "A1231") {
        return {
          success: true,
          data: {
            avatar: "https://avatars.githubusercontent.com/u/44761321",
            username: "A1231",
            nickname: "Steven Chen(A1231)",
            // 一个用户可能有多个角色
            roles: ["admin"],
            accessToken: "eyJhbGciOiJIUzUxMiJ9.admin",
            refreshToken: "eyJhbGciOiJIUzUxMiJ9.adminRefresh",
            expires: "2030/10/30 00:00:00"
          }
        };
      } else if (body.username.toUpperCase() === "C1231") {
        return {
          success: true,
          data: {
            avatar: "https://avatars.githubusercontent.com/u/44761321",
            username: "C1231",
            nickname: "Steven Chen(C1231)",
            // 一个用户可能有多个角色
            roles: ["admin"],
            accessToken: "eyJhbGciOiJIUzUxMiJ9.admin",
            refreshToken: "eyJhbGciOiJIUzUxMiJ9.adminRefresh",
            expires: "2030/10/30 00:00:00"
          }
        };
      } else {
        return {
          success: true,
          data: {
            avatar: "https://avatars.githubusercontent.com/u/52823142",
            username: "common",
            nickname: "小林",
            roles: ["common"],
            accessToken: "eyJhbGciOiJIUzUxMiJ9.common",
            refreshToken: "eyJhbGciOiJIUzUxMiJ9.commonRefresh",
            expires: "2030/10/30 00:00:00"
          }
        };
      }
    }
  }
]);
