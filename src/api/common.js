/*
 * @Author: Sid Li
 * @Date: 2026-03-16 15:03:38
 * @LastEditors: Sid Li
 * @LastEditTime: 2026-03-20 13:37:18
 * @FilePath: \admin-demo\src\api\common.js
 * @Description:
 */
import request from "@/utils/request.js";

export function homeImage() {
  return request({
    url: "api/home/index_images",
    method: "get",
  });
}

export function deleteImage(image_id) {
  return request({
    url: `api/home/delete_image/${image_id}`,
    method: "delete",
  });
}

export function getServiceContent() {
  return request({
    url: "api/service/content",
    method: "get",
  });
}

export function putServiceContent(data) {
  return request({
    url: "api/service/content",
    method: "put",
    data,
  });
}

export function fileListApi() {
  return request({
    url: "api/files/list",
    method: "get",
  });
}

export function deleteFile(file_id) {
  return request({
    url: `api/files/delete/${file_id}`,
    method: "delete",
  });
}

// ==========================================================================================

export function hello() {
  return request({
    url: "api/hello",
    method: "get",
  });
}
export function addList(data) {
  return request({
    url: "api/tasks",
    method: "post",
    data,
  });
}
export function getList() {
  return request({
    url: "api/tasks",
    method: "get",
  });
}
export function deleteList(id) {
  return request({
    url: "api/tasks/" + id,
    method: "delete",
  });
}

export function updateList(id, data) {
  return request({
    url: "api/tasks/" + id,
    method: "put",
    data,
  });
}

//token获取
export function login() {
  return request({
    url: "FreeIeAPI/Login",
    method: "get",
  });
}

export function writeStacking(data) {
  return request({
    url: `FreeIeAPI/WriteStacking`,
    method: "post",
    data,
  });
}

export function editUser(n) {
  return request({
    url: "/api/user",
    method: "put",
    data: n,
  });
}

export function removerUser(n) {
  return request({
    url: "/system/user/" + n,
    method: "DELETE",
  });
}
