/*
 * @Author: Sid Li
 * @Date: 2026-03-16 15:03:38
 * @LastEditors: Sid Li
 * @LastEditTime: 2026-03-21 15:58:00
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

export function fileListApi(page, pageSize) {
  return request({
    url: `api/files/list?page=${page}&page_size=${pageSize}`,
    method: "get",
  });
}

export function deleteFile(file_id) {
  return request({
    url: `api/files/delete/${file_id}`,
    method: "delete",
  });
}

//news
export function saveNews(data) {
  return request({
    url: "api/news/save",
    method: "post",
    data,
  });
}

//news list
export function newsListApi(page, pageSize) {
  return request({
    url: `api/news/list?page=${page}&page_size=${pageSize}`,
    method: "get",
  });
}

//news detail
export function newsDetailApi(id) {
  return request({
    url: `api/news/${id}`,
    method: "get",
  });
}

//news delete
export function deleteNews(id) {
  return request({
    url: `api/news/delete/${id}`,
    method: "delete",
  });
}

//解决方案中行业列表
export function industryListApi() {
  return request({
    url: "api/industries/list",
    method: "get",
  });
}

//增加修改行业
export function addOrUpdateIndustry(data) {
  return request({
    url: "api/industries/save",
    method: "post",
    data,
  });
}

//删除行业
export function deleteIndustry(industry_id) {
  return request({
    url: `api/industries/delete/${industry_id}`,
    method: "delete",
  });
}

//增加修改方案
export function addOrUpdateSolution(data) {
  return request({
    url: "api/solution/save",
    method: "post",
    data,
  });
}

//方案列表
export function solutionListApi(params) {
  return request({
    url: "/api/solution/list",
    method: "get",
    params: params,
  });
}
//删除方案
export function deleteSolution(solution_id) {
  return request({
    url: `api/solution/delete/${solution_id}`,
    method: "delete",
  });
}

//方案详情
export function solutionDetailApi(solution_id) {
  return request({
    url: `api/solution/detail/${solution_id}`,
    method: "get",
  });
}

//通用上传图片
export function uploadImageCommon(data) {
  return request({
    url: "api/common/upload_image",
    method: "post",
    data,
    headers: {
      "Content-Type": "multipart/form-data",
    },
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
