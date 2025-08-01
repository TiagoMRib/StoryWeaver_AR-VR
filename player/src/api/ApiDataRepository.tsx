import axios, { AxiosResponse, AxiosRequestConfig } from "axios";
import { HttpClient } from "./HttpClient";
import { IDataRepository } from "./IDataRepository";
import { BASE_URL } from "../data/constants";
import { ProjectsBaseInfo } from "../models/ProjectsBaseInfo";
import { Project } from "../models/Project";
import { ThreeDModelTypes } from "../models/ThreeDModelTypes";
import { User } from "../models/UserInfo";


export class ApiResponse<T> {
    data?: T;
    succeeded?: boolean;
    errors: any;
}


const transform = (response: AxiosResponse): Promise<ApiResponse<any>> => {
  
    return new Promise((resolve, reject) => {
     
      const result: ApiResponse<any> = {
        data: response,
        succeeded: response.status === 200,
        errors: response,
      };
      resolve(result);
    });
  };


export class ApiDataRepository extends HttpClient implements IDataRepository{
    
    currentProject: Project | null = null;

    private static instance: ApiDataRepository;
    private constructor() {
        super();
    }
    async getUserInfo(): Promise<User> {
        const instance = this.createInstance();

        try{
            const result = await instance.get(`/user-info/${localStorage.getItem('userEmail')}`).then(transform);
            return result.data;
        }
        catch(error){
            console.log(error); 
            throw error;
        }
    }
    async markEndingObtained(projectId: string, endingName: string, experienceName: string, allEndings: string[]): Promise<any> {
        const instance = this.createInstance();

        try{
            const result = await instance.post(`/finish-story`,{
                storyId: projectId,
                userEmail : localStorage.getItem('userEmail'),
                ending : endingName,
                experienceName : experienceName,
                allEndings : allEndings

            }).then(transform);
            
            return result.data;
        }
        catch(error){
            console.log(error); 
            throw error;
        }
    }
    public static getInstance(): ApiDataRepository {
        if (!ApiDataRepository.instance) {
            ApiDataRepository.instance = new ApiDataRepository();
        }

        return ApiDataRepository.instance;
    }

    public getMapPlaceCoords = async (mapName: string, placeName: string): Promise<any> => {
        if (this.currentProject === null){
           throw new Error("No project loaded");
        }
       const anchor = this.currentProject.maps.find((map: any) => map.name === mapName)?.anchors.find((anchor : any) => anchor.name === placeName);
       return anchor ? anchor.coords :
        new Error("No anchor found");
    }
    

    public getFilePath = async (fileName: string): Promise<string> => {
        if (this.currentProject === null){
            throw new Error("No project loaded");
         }
        return `/files/${this.currentProject?.id}/${fileName}`;
    }
    public getThreeDModelPath = async (fileName: string, modelType: ThreeDModelTypes): Promise<string> => {
         
        const fileNameWithoutExtension = fileName.split('.')[0];
        const fileNameWithoutUUID = fileNameWithoutExtension.split('-')[5];
        const storyID = localStorage.getItem('storyId');
        if(!storyID){
            throw new Error('Story ID is not set');
        }

        if(modelType == ThreeDModelTypes.gltf){
            return `/files/${storyID}/${fileNameWithoutExtension}/scene.gltf`;
        }else if(modelType == ThreeDModelTypes.obj){
            return `/files/${storyID}/${fileNameWithoutExtension}/${fileNameWithoutUUID}.obj`;
        }

        return '';
                
            
    }

    public getFile = async (fileName: string): Promise<Blob> => {
        const config: AxiosRequestConfig = {
            responseType: 'blob',
        };
        
        const instance = this.createInstance();

        try{
            const result = await instance.get(`/files/${this.currentProject?.id}/${fileName}`, config).then(transform);
            
            return result.data;
        }
        catch(error){
            console.log(error); 
            throw error;
        }
 
    }



    public getProject = async (projectId: string): Promise<Project> => {
        const instance = this.createInstance();

        try{
            const result = await instance.get(`/load/${projectId}`).then(transform);
            this.currentProject = result.data;
            return result.data;
        }
        catch(error){
            console.log(error); 
            throw error;
        }
    }

    public getExportedProjects = async (): Promise<ProjectsBaseInfo>  => {
        const instance = this.createInstance();

        try{
            const result = await instance.get(`/exported-projects`).then(transform);
            return result.data;
        }
        catch(error){
            console.log(error); 
            throw error;
        }

    }

    public getProjects = async (): Promise<ProjectsBaseInfo> => {
        const instance = this.createInstance();

        try{
            const result = await instance.get(`/projects`).then(transform);
            return result.data;
        }
        catch(error){
            console.log(error); 
            throw error;
        }
    }

    public searchProjects = async (searchText: string): Promise<ProjectsBaseInfo> => {
        const instance = this.createInstance();

        try{
            const result = await instance.get(`/projects/${searchText}`).then(transform);
            return result.data;
        }
        catch(error){
            console.log(error); 
            throw error;
        }
    }

    public getAllUsers = async (): Promise<any> => {
        const instance = this.createInstance();

        try{
            const result = await instance.post(`/user/authenticated/getAll`,

            {
                loginToken: localStorage.getItem('loginToken')
            }
            ).then(transform);
            return result.data;
        }
        catch(error){
            console.log(error); 
            throw error;
        }
    }

    public loginUser = async (bodyObject: any): Promise<any> => {
        const instance = this.createInstance();

        try{
            const result = await instance.post(`/login/user`, bodyObject).then(transform);
            return result.data;
        }
        catch(error){
            console.log(error); 
            throw error;
        }
    }

    public logoutUser = async (): Promise<any> => {
        const instance = this.createInstance();

        try{
            const result = await instance.get(`/logout/user`).then(transform);
            return result.data;
        }
        catch(error){
            console.log(error); 
            throw error;
        }
    }

    public checkLoginStatus = async (): Promise<any> => {
        const instance = this.createInstance();

        try{
            const result = await instance.post(`/user/checkLoginStatus`,
            {
                loginToken: localStorage.getItem('loginToken')
            }

            ).then(transform);
            return result.data;
        }
        catch(error){
            console.log(error); 
            throw error;
        }
    }
  
}