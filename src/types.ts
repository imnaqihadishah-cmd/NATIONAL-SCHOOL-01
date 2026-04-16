export interface Branch {
  id: string;
  name: string;
  location: string;
  contact: string;
}

export interface Student {
  id: string;
  branchId: string;
  name: string;
  rollNumber: string;
  class: string;
  section: string;
  fatherName: string;
  contact: string;
  address: string;
  status: 'active' | 'inactive';
  imageUrl?: string;
}

export interface Teacher {
  id: string;
  branchId: string;
  name: string;
  employeeId: string;
  subject: string;
  qualification: string;
  contact: string;
  salary: number;
  status: 'active' | 'inactive';
  imageUrl?: string;
}

export interface Fee {
  id: string;
  studentId: string;
  branchId: string;
  month: string;
  year: number;
  amount: number;
  status: 'paid' | 'unpaid';
  datePaid?: string;
}

export interface SalaryPayment {
  id: string;
  teacherId: string;
  branchId: string;
  month: string;
  year: number;
  amount: number;
  status: 'paid' | 'unpaid';
  datePaid?: string;
}

export interface Attendance {
  id: string;
  personId: string;
  type: 'student' | 'teacher';
  branchId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
}

export interface Expense {
  id: string;
  branchId: string;
  category: string;
  amount: number;
  description: string;
  date: string;
}

export interface Exam {
  id: string;
  branchId: string;
  title: string;
  date: string;
  class: string;
  subject: string;
}

export interface SubjectMark {
  subject: string;
  obtained: number;
  total: number;
}

export interface Result {
  id: string;
  examId: string;
  studentId: string;
  marksObtained: number;
  totalMarks: number;
  grade: string;
  subjectMarks?: SubjectMark[];
}
