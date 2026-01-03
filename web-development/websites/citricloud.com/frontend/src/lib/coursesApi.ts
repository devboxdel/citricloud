import axios from "axios";

const API_BASE = "/api/v1/courses/courses";

export type LessonInput = {
  title: string;
  content: string;
  completed?: boolean;
};

export type CourseInput = {
  title: string;
  category: string;
  duration: string;
  level: string;
  snippet?: string;
  is_favorite?: boolean;
  labels?: string[];
  completed?: boolean;
  progress?: number;
  lessons: LessonInput[];
};

export const getCourses = async () => {
  const res = await axios.get(API_BASE);
  return res.data as any[];
};

export const createCourse = async (course: CourseInput) => {
  const res = await axios.post(API_BASE, course);
  return res.data;
};

export const updateCourse = async (id: number, course: Partial<CourseInput>) => {
  const res = await axios.put(`${API_BASE}/${id}`, course);
  return res.data;
};

export const deleteCourse = async (id: number) => {
  await axios.delete(`${API_BASE}/${id}`);
};
