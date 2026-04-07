/*
 * @Author: Sid Li
 * @Date: 2026-03-16 15:03:38
 * @LastEditors: Sid Li
 * @LastEditTime: 2026-04-07 08:44:53
 * @FilePath: \admin-demo\src\api\common.js
 * @Description:
 */
import request from "@/utils/request.js";

export function homeImage() {
  return request({
    url: "/api/home/index_images",
    method: "get",
  });
}

export function deleteImage(image_id) {
  return request({
    url: `/api/home/delete_image/${image_id}`,
    method: "delete",
  });
}

export function getServiceContent() {
  return request({
    url: "/api/service/content",
    method: "get",
  });
}

export function putServiceContent(data) {
  return request({
    url: "/api/service/content",
    method: "put",
    data,
  });
}

export function fileListApi(page, pageSize,keyword) {
  return request({
    url: `/api/files/list?page=${page}&page_size=${pageSize}&keyword=${keyword}`,
    method: "get",
  });
}

export function deleteFile(file_id) {
  return request({
    url: `/api/files/delete/${file_id}`,
    method: "delete",
  });
}

//news
export function saveNews(data) {
  return request({
    url: "/api/news/save",
    method: "post",
    data,
  });
}

//news list
export function newsListApi(page, pageSize) {
  return request({
    url: `/api/news/list?page=${page}&page_size=${pageSize}`,
    method: "get",
  });
}

//news detail
export function newsDetailApi(id) {
  return request({
    url: `/api/news/${id}`,
    method: "get",
  });
}

//news delete
export function deleteNews(id) {
  return request({
    url: `/api/news/delete/${id}`,
    method: "delete",
  });
}

//解决方案中行业列表
export function industryListApi() {
  return request({
    url: "/api/industries/list",
    method: "get",
  });
}

//增加修改行业
export function addOrUpdateIndustry(data) {
  return request({
    url: "/api/industries/save",
    method: "post",
    data,
  });
}

//删除行业
export function deleteIndustry(industry_id) {
  return request({
    url: `/api/industries/delete/${industry_id}`,
    method: "delete",
  });
}

//增加修改方案
export function addOrUpdateSolution(data) {
  return request({
    url: "/api/solution/save",
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
    url: `/api/solution/delete/${solution_id}`,
    method: "delete",
  });
}

//方案详情
export function solutionDetailApi(solution_id) {
  return request({
    url: `/api/solution/detail/${solution_id}`,
    method: "get",
  });
}

//通用上传图片
export function uploadImageCommon(data) {
  return request({
    url: "/api/common/upload_image",
    method: "post",
    data,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export function categoryTree() {
  return request({
    url: "/api/category/tree",
    method: "get",
  });
}

export function saveCategory(data) {
  return request({
    url: "/api/category/save",
    method: "post",
    data,
  });
}

export function deleteCategory(id) {
  return request({
    url: `/api/category/${id}`,
    method: "delete",
  });
}

//增加产品机器人
export function saveProductRobot(data) {
  return request({
    url: "/api/product/robot/save",
    method: "post",
    data,
  });
}

//增加产品运动控制器
export function saveProductsSport(data) {
  return request({
    url: "/api/product/sport/save",
    method: "post",
    data,
  });
}

export function productList(params) {
  return request({
    url: "/api/product/list",
    method: "get",
    params,
  });
}

// 删除产品
export function deleteProduct(id) {
  return request({
    url: `/api/product/${id}`,
    method: "delete",
  });
}

export function getProductDetail(robotType,id) {
  return request({
    url: `/api/product/detail/${robotType}/${id}`,
    method: "get",
  });
}

 