import axios, { AxiosResponse, AxiosRequestConfig } from "axios";
import { HttpClient } from "./HttpClient";
import { IDataRepository } from "./IDataRepository";
import { BASE_URL } from "../data/constants";
import { ProjectsBaseInfo } from "../models/ProjectsBaseInfo";
import { Project } from "../models/Project";
import { ThreeDModelTypes } from "../models/ThreeDModelTypes";
import { NodeType } from "../models/NodeTypes";


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
    private static instance: ApiDataRepository;
    private constructor() {
        super();
    }
    public static getInstance(): ApiDataRepository {
        if (!ApiDataRepository.instance) {
            ApiDataRepository.instance = new ApiDataRepository();
        }

        return ApiDataRepository.instance;
    }

    public getFilePath = async (fileName: string): Promise<string> => {
          
      
        const storyID = localStorage.getItem('storyId');
        if(!storyID){
            throw new Error('Story ID is not set');
        }
        
        return `${BASE_URL}/files/${storyID}/${fileName}`;
            
        
    }

    public getThreeDModelPath = async (fileName: string, modelType: ThreeDModelTypes): Promise<string> => {
         
        const fileNameWithoutExtension = fileName.split('.')[0];
        const fileNameWithoutUUID = fileNameWithoutExtension.split('-')[5];
        const storyID = localStorage.getItem('storyId');
        if(!storyID){
            throw new Error('Story ID is not set');
        }


        if(modelType == ThreeDModelTypes.gltf){
            return `${BASE_URL}/files/${storyID}/${fileNameWithoutExtension}/scene.gltf`;
        }else if(modelType == ThreeDModelTypes.obj){
            return `${BASE_URL}/files/${storyID}/${fileNameWithoutExtension}/${fileNameWithoutUUID}.obj`;
        }

        return '';
                
            
        }

    public getFile = async (fileName: string): Promise<Blob> => {
        const config: AxiosRequestConfig = {
            responseType: 'blob',
        };
        
        const instance = this.createInstance();
        const storyID = localStorage.getItem('storyId');

        try{
            const result = await instance.get(`${BASE_URL}/files/${storyID}/${fileName}`, config).then(transform);
            
            return result.data;
        }
        catch(error){
            console.log(error); 
            throw error;
        }
 
    }

    public uploadFile = async (file: File): Promise<any> => {
    console.log("[uploadFile] Preparing to upload file:", file.name);
    
    const storyId = localStorage.getItem('storyId');
    if (!storyId) {
        console.warn("[uploadFile] No story ID found in localStorage!");
    } else {
        console.log("[uploadFile] Using storyId:", storyId);
    }

    const formData = new FormData();
    formData.append("projectID", localStorage.getItem("storyId") || "");
    formData.append("file", file, file.name);

    const instance = this.createInstance();

    try {
        console.log("[uploadFile] Sending POST request to:", `${BASE_URL}/upload`);
        const result = await instance.post(`${BASE_URL}/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
        });

        console.log("[uploadFile] Upload successful. Server response:", result);
        return transform(result);
    } catch (error: any) {
        console.error("[uploadFile] Upload failed:", error.message || error);
        if (error.response) {
        console.error("[uploadFile] Server responded with:", error.response.status, error.response.data);
        }
        throw error;
    }
    };

    public deleteFile = async (fileName: string): Promise<any> => {
        const instance = this.createInstance();
        const storyID = localStorage.getItem('storyId');
        try{
            const result = await instance.delete(`${BASE_URL}/files/${storyID}/${fileName}`).then(transform);
            return result;
        }
        catch(error){
            console.log(error); 
            throw error;
        }
    }

    public saveProject = async (projectTitle: any, nodes: any, edges: any, characters: any, maps: any, locations: any, interactions: any): Promise<any> => {
        const instance = this.createInstance();
        const experienceName = localStorage.getItem('experienceName');
        const experienceDescription = localStorage.getItem('experienceDescription');
        const experienceTags = JSON.parse(localStorage.getItem('experienceTags') || '[]'); 
        try{ 
            const result = await instance.post(`${BASE_URL}/save`, {
                storyId : localStorage.getItem('storyId'),
                projectTitle,
                experienceName,
                description: experienceDescription,
                tags: experienceTags,
                nodes,
                edges,
                characters,
                locations,
                interactions,
                maps,
                
            }).then(transform).then((response) => {
                localStorage.setItem('storyId', response.data.storyId);
            });
            return result;
        }
        catch(error){
            console.log(error); 
            throw error;
        }
    }

    public async deleteProject(projectId: string): Promise<any> {
        const instance = this.createInstance();
  
        try{
            const result = await instance.delete(`${BASE_URL}/delete/${projectId}`
            ).then(transform);
            return result.data;
        }
        catch(error){
            console.log(error); 
            throw error;
        }
    }

    public unzipFile = async (fileName: string): Promise<any> => {
        const instance = this.createInstance();
        const storyID = localStorage.getItem('storyId');
        try{
            const result = await instance.get(`${BASE_URL}/unzip/${storyID}/${fileName}`).then(transform);
            return result;
        }
        catch(error){
            console.log(error); 
            throw error;
        }
    }

    public checkIfFileExists = async (fileName: string): Promise<any> => {
        const instance = this.createInstance();
        const storyID = localStorage.getItem('storyId');
        try{
            const result = await instance.get(`${BASE_URL}/files/${storyID}/${fileName}`).then(transform);
            return result;
        }
        catch(error){
            console.log(error); 
            throw error;
        }
    }

    public getMapPlaceCoords = async (mapName: string, placeName: string): Promise<any> => {
       const maps = JSON.parse(localStorage.getItem('maps') || '[]');
       const anchor = maps.find((map: any) => map.name === mapName)?.anchors.find((anchor : any) => anchor.name === placeName);
       return anchor ? anchor.coords :
        new Error("No anchor found");
    }

    public exportProject = async (
        projectTitle: any,
        nodes: any, 
        edges: any, 
        characters: any, 
        maps: any, 
        locations: any[],
        interactions: any[],
        experienceName: string, 
        experienceDescription: string, 
        experienceTags: any,
        
    ): Promise<any> => {
        
        const instance = this.createInstance();
        const storyID = localStorage.getItem('storyId');

        const endings = nodes.filter((node: any) => node.type === NodeType.endNode).map((node: any) => node.data.id);
        const endingsWithoutDuplicates = endings.filter((item: any, index: any) => endings.indexOf(item) === index);
    
        try{        
            const result = await instance.post(`${BASE_URL}/export`,
                {
                    storyId : storyID,
                    projectTitle : projectTitle,
                    experienceName : experienceName,
                    description : experienceDescription,
                    tags : experienceTags,
                    nodes: nodes,
                    edges: edges,
                    characters : characters,
                    maps:  maps,
                    locations,
                    interactions,
                    endings: endingsWithoutDuplicates,
                    
                }
            ).then(transform);
            return result;
        }
        catch(error){
            console.log(error); 
            throw error;
        }
    }

    public getProject = async (projectId: string): Promise<Project> => {
        const instance = this.createInstance();

        try{
            const result = await instance.get(`${BASE_URL}/load/${projectId}`).then(transform);
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
            const result = await instance.get(`${BASE_URL}/projects`).then(transform);
            return result.data;
        }
        catch(error){
            console.log(error); 
            throw error;
        }
    }

    public requestGenerateMarkerFiles = async (fileName: string): Promise<any> => {
        const instance = this.createInstance();
        const storyID = localStorage.getItem('storyId');
        console.log("=== GENERATE MARKER REQUEST DEBUG ===");
        console.log("1. Parameters:", { storyID, fileName });
        console.log("2. Request URL:", `${BASE_URL}/generateMarker/${storyID}/${fileName}`);
        console.log("3. Instance headers:", instance.defaults.headers);
        console.log("===================================");
        
        try{
            console.log("4. Sending request...");
            const result = await instance.get(`${BASE_URL}/generateMarker/${storyID}/${fileName}`).then(transform);
            console.log("5. Request successful:", result);
            return result;
        }
        catch(error){
            console.error("5. Request failed:", error); 
            throw error;
        }
    }
  
}