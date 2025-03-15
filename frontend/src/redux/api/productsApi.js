import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const productApi = createApi({
    reducerPath: "productApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
    tagTypes: ["Product"],
    endpoints: (builder) => ({
            getProducts: builder.query({
                query: (params) => ({
            url: "/products",
             params: { 
               page: params?.page,
               keyword: params?.keyword,
               category: params?.category,
               "price[gte]": params.min,
               "price[lte]": params.max,
               "ratings[gte]": params?.ratings,
            }
            }),
                }),
                getProductDetails: builder.query({
                    query: (id) => `/products/${id}`,
                    providesTags: ["Product"]
                    }),
                    submitReview: builder.mutation({
                        query(body) {
                           return {
                              url: "/reviews",
                              method: "PUT",
                              body,
                        }
                    },
                    invalidatesTags: ["Product"]
                }),
                createProduct: builder.mutation({
                    query(body) {
                       return {
                          url: "/admin/newproduct",
                          method: "POST",
                          body,
                    }
                },
                invalidatesTags: ["AdminProducts"],
            }),
            updateProduct: builder.mutation({
                query({id, body}) {
                   return {
                      url: `/admin/products/${id}`,
                      method: "PUT",
                      body,
                }
            },
            invalidatesTags: ["Product","AdminProducts"],
        }),
        uploadProductImages: builder.mutation({
            query({id, body}) {
               return {
                  url: `/admin/products/${id}/upload_images`,
                  method: "PUT",
                  body,
            }
        },
        invalidatesTags: ["Product"],
    }),
    deleteProductImage: builder.mutation({
        query({id, body}) {
           return {
              url: `/admin/products/${id}/delete_images`,
              method: "PUT",
              body,
        }
    },
}),
deleteProduct: builder.mutation({
    query(id) {
       return {
          url: `/admin/products/${id}/delete`,
          method: "DELETE",
    }
},
invalidatesTags: ["Product","AdminProducts"],
}),
            canUserReview: builder.query({
                query: (productId) => `/can_review/?productId=${productId}`,
             }),
             getAdminProducts: builder.query({
                query: () => `/admin/products`,
             }),
             getProductReviews: builder.query({
                query: (productId) => `/reviews?id=${productId}`,
             }),
             getResult: builder.query({
                query: (courseName) => `/results/${courseName}`,
             }),
        }),
    });
        
export const {useGetResultQuery, useGetProductsQuery, useGetProductDetailsQuery, useSubmitReviewMutation, useCanUserReviewQuery, useGetAdminProductsQuery, useCreateProductMutation, useUpdateProductMutation, useUploadProductImagesMutation, useDeleteProductImageMutation, useDeleteProductMutation, useLazyGetProductReviewsQuery} = productApi