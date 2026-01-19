
import Project from "../models/project.js";

export const getProjectByStudentId = async (studentId) => {
    return await Project.findOne({ student: studentId }).sort({ createdAt: -1 });
}

export const createProject = async (projectData) => {
    const project = new Project(projectData);
    return await project.save();
} ;  

export const getProjectById = async (id) => {
    const project = await Project.findById(id).populate('student',"name email").populate("supervisor","name email");

    if(!project) {
        throw new Error("Project not found",404);
    }
    return project;
}

export const addFilesToProject= async (projectId, files) => {
    const project = await Project.findById(projectId);
if(!project) {
    throw new Error("Project not found");
}

const fileMetaData=files.map(file=>({
    fileType:file.mimetype,
    fileUrl:file.path,
    originalName:file.originalname,
    uploadedAt:new Date(),
}));

project.files.push(...fileMetaData);
await project.save();
return project;

}