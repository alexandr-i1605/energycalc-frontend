/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface Device {
  /** ID */
  id?: number;
  /**
   * Название устройства
   * @minLength 1
   * @maxLength 255
   */
  name: string;
  /**
   * Категория
   * @minLength 1
   * @maxLength 100
   */
  category: string;
  /** Image url */
  image_url?: string;
  /**
   * Мощность (Вт)
   * @min -2147483648
   * @max 2147483647
   */
  power: number;
  /** Потребление в месяц (кВт) */
  consumption: number;
  /**
   * Пиковая мощность (Вт)
   * @min -2147483648
   * @max 2147483647
   */
  peak_power: number;
  /**
   * Напряжение
   * @minLength 1
   * @maxLength 50
   */
  voltage: string;
  /**
   * Работа в день
   * @minLength 1
   * @maxLength 50
   */
  work_per_day: string;
  /**
   * Энергетический класс
   * @minLength 1
   * @maxLength 10
   */
  energy_class: string;
}

export interface DeviceInRequest {
  device?: Device;
  /**
   * Quantity
   * @min -2147483648
   * @max 2147483647
   */
  quantity?: number;
}

export interface CalculationRequest {
  /** ID */
  id?: number;
  /** Status */
  status?: CalculationRequestStatusEnum;
  /**
   * Residents
   * @min -2147483648
   * @max 2147483647
   */
  residents?: number;
  /**
   * Temperature
   * @min -2147483648
   * @max 2147483647
   */
  temperature?: number;
  /**
   * Result
   * @min -2147483648
   * @max 2147483647
   */
  result?: number;
  /**
   * Creation datetime
   * @format date-time
   */
  creation_datetime?: string;
  /**
   * Formation datetime
   * @format date-time
   */
  formation_datetime?: string | null;
  /**
   * Completion datetime
   * @format date-time
   */
  completion_datetime?: string | null;
  /**
   * Client username
   * @minLength 1
   */
  client_username?: string;
  /**
   * Moderator username
   * @minLength 1
   */
  moderator_username?: string | null;
}

export interface UserLogin {
  /**
   * Username
   * @minLength 1
   */
  username: string;
  /**
   * Password
   * @minLength 1
   */
  password: string;
}

export interface UserRegister {
  /**
   * Username
   * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
   * @minLength 1
   * @maxLength 150
   * @pattern ^[\w.@+-]+$
   */
  username: string;
  /**
   * Password
   * @minLength 1
   */
  password: string;
  /**
   * First name
   * @maxLength 150
   */
  first_name?: string;
  /**
   * Last name
   * @maxLength 150
   */
  last_name?: string;
  /**
   * Email address
   * @format email
   * @maxLength 254
   */
  email?: string;
}

export interface MyUser {
  /** ID */
  id?: number;
  /**
   * Username
   * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
   * @minLength 1
   * @maxLength 150
   * @pattern ^[\w.@+-]+$
   */
  username: string;
  /**
   * First name
   * @maxLength 150
   */
  first_name?: string;
  /**
   * Last name
   * @maxLength 150
   */
  last_name?: string;
  /**
   * Email address
   * @format email
   * @maxLength 254
   */
  email?: string;
  /** Is moderator */
  is_moderator?: boolean;
}

/** Status */
export enum CalculationRequestStatusEnum {
  DRAFT = "DRAFT",
  DELETED = "DELETED",
  FORMED = "FORMED",
  COMPLETED = "COMPLETED",
  REJECTED = "REJECTED",
}

export interface ConsumptionCalcListParams {
  status?: string;
  date_start?: string;
  date_end?: string;
}

export interface ConsumptionCalcReadParams {
  requestId: string;
}

export interface ConsumptionCalcCompleteUpdatePayload {
  /** "complete" или "reject" */
  action?: string;
}

export interface ConsumptionCalcCompleteUpdateParams {
  requestId: string;
}

export interface ConsumptionCalcDeleteDeleteParams {
  requestId: string;
}

export interface ConsumptionCalcDevicesDeleteDeleteParams {
  requestId: string;
  deviceId: string;
}

export interface ConsumptionCalcDevicesUpdateUpdateParams {
  requestId: string;
  deviceId: string;
}

export interface ConsumptionCalcFormUpdateParams {
  requestId: string;
}

export interface ConsumptionCalcUpdateUpdateParams {
  requestId: string;
}

export interface DevicesListParams {
  /** Название устройства */
  name?: string;
}

export interface DevicesReadParams {
  deviceId: string;
}

export interface DevicesAddImageCreateParams {
  deviceId: string;
}

export interface DevicesAddToRequestCreateParams {
  deviceId: string;
}

export interface DevicesDeleteDeleteParams {
  deviceId: string;
}

export interface DevicesUpdateUpdateParams {
  deviceId: string;
}

export interface UsersProfileListParams {
  userId: string;
}

export interface UsersUpdateUpdateParams {
  userId: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "http://localhost:8000/api",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title EnergyCalc API
 * @version v1
 * @license BSD License
 * @termsOfService https://www.google.com/policies/terms/
 * @baseUrl http://localhost:8000/api
 * @contact <contact@energycalc.local>
 *
 * API для расчета энергопотребления
 */
export class Api<SecurityDataType extends unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  consumptionCalc = {
    /**
     * @description GET список заявок с фильтрацией
     *
     * @tags consumption-calc
     * @name ConsumptionCalcList
     * @request GET:/consumption-calc/
     * @secure
     * @response `200` `void`
     */
    consumptionCalcList: (
      query: ConsumptionCalcListParams,
      params: RequestParams = {},
    ) =>
      this.http.request<void, any>({
        path: `/consumption-calc/`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description GET иконки корзины
     *
     * @tags consumption-calc
     * @name ConsumptionCalcCartIconList
     * @request GET:/consumption-calc/cart_icon/
     * @secure
     * @response `200` `void`
     */
    consumptionCalcCartIconList: (params: RequestParams = {}) =>
      this.http.request<void, any>({
        path: `/consumption-calc/cart_icon/`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description GET одна запись заявки
     *
     * @tags consumption-calc
     * @name ConsumptionCalcRead
     * @request GET:/consumption-calc/{request_id}/
     * @secure
     * @response `200` `void`
     */
    consumptionCalcRead: (
      { requestId, ...query }: ConsumptionCalcReadParams,
      params: RequestParams = {},
    ) =>
      this.http.request<void, any>({
        path: `/consumption-calc/${requestId}/`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
 * @description PUT завершить/отклонить модератором
 *
 * @tags consumption-calc
 * @name ConsumptionCalcCompleteUpdate
 * @request PUT:/consumption-calc/{request_id}/complete/
 * @secure
 * @response `200` `{
  \** "complete" или "reject" *\
    action?: string,

}`
 */
    consumptionCalcCompleteUpdate: (
      { requestId, ...query }: ConsumptionCalcCompleteUpdateParams,
      data: ConsumptionCalcCompleteUpdatePayload,
      params: RequestParams = {},
    ) =>
      this.http.request<
        {
          /** "complete" или "reject" */
          action?: string;
        },
        any
      >({
        path: `/consumption-calc/${requestId}/complete/`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description DELETE удаление заявки
     *
     * @tags consumption-calc
     * @name ConsumptionCalcDeleteDelete
     * @request DELETE:/consumption-calc/{request_id}/delete/
     * @secure
     * @response `204` `void`
     */
    consumptionCalcDeleteDelete: (
      { requestId, ...query }: ConsumptionCalcDeleteDeleteParams,
      params: RequestParams = {},
    ) =>
      this.http.request<void, any>({
        path: `/consumption-calc/${requestId}/delete/`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description DELETE удаление из заявки
     *
     * @tags consumption-calc
     * @name ConsumptionCalcDevicesDeleteDelete
     * @request DELETE:/consumption-calc/{request_id}/devices/{device_id}/delete/
     * @secure
     * @response `204` `void`
     */
    consumptionCalcDevicesDeleteDelete: (
      {
        requestId,
        deviceId,
        ...query
      }: ConsumptionCalcDevicesDeleteDeleteParams,
      params: RequestParams = {},
    ) =>
      this.http.request<void, any>({
        path: `/consumption-calc/${requestId}/devices/${deviceId}/delete/`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description PUT изменение количества
     *
     * @tags consumption-calc
     * @name ConsumptionCalcDevicesUpdateUpdate
     * @request PUT:/consumption-calc/{request_id}/devices/{device_id}/update/
     * @secure
     * @response `200` `DeviceInRequest`
     */
    consumptionCalcDevicesUpdateUpdate: (
      {
        requestId,
        deviceId,
        ...query
      }: ConsumptionCalcDevicesUpdateUpdateParams,
      data: DeviceInRequest,
      params: RequestParams = {},
    ) =>
      this.http.request<DeviceInRequest, any>({
        path: `/consumption-calc/${requestId}/devices/${deviceId}/update/`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description PUT сформировать создателем
     *
     * @tags consumption-calc
     * @name ConsumptionCalcFormUpdate
     * @request PUT:/consumption-calc/{request_id}/form/
     * @secure
     * @response `200` `void`
     */
    consumptionCalcFormUpdate: (
      { requestId, ...query }: ConsumptionCalcFormUpdateParams,
      params: RequestParams = {},
    ) =>
      this.http.request<void, any>({
        path: `/consumption-calc/${requestId}/form/`,
        method: "PUT",
        secure: true,
        ...params,
      }),

    /**
     * @description PUT изменения полей заявки
     *
     * @tags consumption-calc
     * @name ConsumptionCalcUpdateUpdate
     * @request PUT:/consumption-calc/{request_id}/update/
     * @secure
     * @response `200` `CalculationRequest`
     */
    consumptionCalcUpdateUpdate: (
      { requestId, ...query }: ConsumptionCalcUpdateUpdateParams,
      data: CalculationRequest,
      params: RequestParams = {},
    ) =>
      this.http.request<CalculationRequest, any>({
        path: `/consumption-calc/${requestId}/update/`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  devices = {
    /**
     * @description GET список устройств с фильтрацией
     *
     * @tags devices
     * @name DevicesList
     * @request GET:/devices/
     * @secure
     * @response `200` `void`
     */
    devicesList: (query: DevicesListParams, params: RequestParams = {}) =>
      this.http.request<void, any>({
        path: `/devices/`,
        method: "GET",
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description POST добавление устройства
     *
     * @tags devices
     * @name DevicesCreateCreate
     * @request POST:/devices/create/
     * @secure
     * @response `201` `Device`
     */
    devicesCreateCreate: (data: Device, params: RequestParams = {}) =>
      this.http.request<Device, any>({
        path: `/devices/create/`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description GET одна запись устройства
     *
     * @tags devices
     * @name DevicesRead
     * @request GET:/devices/{device_id}/
     * @secure
     * @response `200` `void`
     */
    devicesRead: (
      { deviceId, ...query }: DevicesReadParams,
      params: RequestParams = {},
    ) =>
      this.http.request<void, any>({
        path: `/devices/${deviceId}/`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description POST добавление изображения
     *
     * @tags devices
     * @name DevicesAddImageCreate
     * @request POST:/devices/{device_id}/add_image/
     * @secure
     * @response `201` `void`
     */
    devicesAddImageCreate: (
      { deviceId, ...query }: DevicesAddImageCreateParams,
      params: RequestParams = {},
    ) =>
      this.http.request<void, any>({
        path: `/devices/${deviceId}/add_image/`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * @description POST добавление в заявку-черновик
     *
     * @tags devices
     * @name DevicesAddToRequestCreate
     * @request POST:/devices/{device_id}/add_to_request/
     * @secure
     * @response `201` `void`
     */
    devicesAddToRequestCreate: (
      { deviceId, ...query }: DevicesAddToRequestCreateParams,
      params: RequestParams = {},
    ) =>
      this.http.request<void, any>({
        path: `/devices/${deviceId}/add_to_request/`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * @description DELETE удаление устройства
     *
     * @tags devices
     * @name DevicesDeleteDelete
     * @request DELETE:/devices/{device_id}/delete/
     * @secure
     * @response `204` `void`
     */
    devicesDeleteDelete: (
      { deviceId, ...query }: DevicesDeleteDeleteParams,
      params: RequestParams = {},
    ) =>
      this.http.request<void, any>({
        path: `/devices/${deviceId}/delete/`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description PUT изменение устройства
     *
     * @tags devices
     * @name DevicesUpdateUpdate
     * @request PUT:/devices/{device_id}/update/
     * @secure
     * @response `200` `Device`
     */
    devicesUpdateUpdate: (
      { deviceId, ...query }: DevicesUpdateUpdateParams,
      data: Device,
      params: RequestParams = {},
    ) =>
      this.http.request<Device, any>({
        path: `/devices/${deviceId}/update/`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  users = {
    /**
     * @description POST аутентификация
     *
     * @tags users
     * @name UsersLoginCreate
     * @request POST:/users/login/
     * @secure
     * @response `201` `UserLogin`
     */
    usersLoginCreate: (data: UserLogin, params: RequestParams = {}) =>
      this.http.request<UserLogin, any>({
        path: `/users/login/`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description POST деавторизация
     *
     * @tags users
     * @name UsersLogoutCreate
     * @request POST:/users/logout/
     * @secure
     * @response `201` `void`
     */
    usersLogoutCreate: (params: RequestParams = {}) =>
      this.http.request<void, any>({
        path: `/users/logout/`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * @description POST регистрация
     *
     * @tags users
     * @name UsersRegisterCreate
     * @request POST:/users/register/
     * @secure
     * @response `201` `UserRegister`
     */
    usersRegisterCreate: (data: UserRegister, params: RequestParams = {}) =>
      this.http.request<UserRegister, any>({
        path: `/users/register/`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description GET профиль пользователя
     *
     * @tags users
     * @name UsersProfileList
     * @request GET:/users/{user_id}/profile/
     * @secure
     * @response `200` `void`
     */
    usersProfileList: (
      { userId, ...query }: UsersProfileListParams,
      params: RequestParams = {},
    ) =>
      this.http.request<void, any>({
        path: `/users/${userId}/profile/`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * @description PUT обновление профиля
     *
     * @tags users
     * @name UsersUpdateUpdate
     * @request PUT:/users/{user_id}/update/
     * @secure
     * @response `200` `MyUser`
     */
    usersUpdateUpdate: (
      { userId, ...query }: UsersUpdateUpdateParams,
      data: MyUser,
      params: RequestParams = {},
    ) =>
      this.http.request<MyUser, any>({
        path: `/users/${userId}/update/`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
