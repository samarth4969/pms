// const TeacherUserList = ({ students, onSelect }) => {
//   return (
//     <div className="w-1/4 border-r p-4">
//       <h3 className="font-semibold mb-4">Assigned Students</h3>

//       {students.length === 0 ? (
//         <p className="text-slate-500">No students assigned</p>
//       ) : (
//         students.map(student => (
//           <div
//             key={student._id}
//             className="p-3 rounded hover:bg-slate-100 cursor-pointer"
//             onClick={() => onSelect(student)}
//           >
//             {student.name}
//           </div>
//         ))
//       )}
//     </div>
//   );
// };

// export default TeacherUserList;
