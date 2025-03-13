// 'use client';

// import { Scholarship } from '@/lib/mockData';
// import { Button } from 'primereact/button';
// import { Card } from 'primereact/card';
// import { Tag } from 'primereact/tag';
// import { useState } from 'react';
// import { formatCurrency, formatDate } from '@/lib/utils';

// interface ScholarshipCardProps {
//   scholarship: Scholarship;
// }

// export default function ScholarshipCard({ scholarship }: ScholarshipCardProps) {
//   const [bookmarked, setBookmarked] = useState(false);

//   const handleBookmark = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     setBookmarked(!bookmarked);
//   };

//   const handleShare = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     // In a real app, implement sharing functionality
//     alert(`Sharing scholarship: ${scholarship.title}`);
//   };

//   const statusSeverity = scholarship.status === 'Active' ? 'success' : 'danger';

//   const footer = (
//     <div className="flex flex-wrap justify-content-between gap-2">
//       <Button 
//         label="View Details" 
//         icon="pi pi-info-circle" 
//         className="p-button-outlined"
//       />
//       {scholarship.status === 'Active' && (
//         <Button 
//           label="Apply Now" 
//           icon="pi pi-check" 
//           severity="success"
//         />
//       )}
//     </div>
//   );

//   const header = (
//     <div className="flex justify-content-between align-items-center">
//       <Tag value={scholarship.status} severity={statusSeverity} />
//       <div className="flex gap-2">
//         <Button 
//           icon={bookmarked ? "pi pi-bookmark-fill" : "pi pi-bookmark"} 
//           rounded 
//           text 
//           severity="secondary" 
//           onClick={handleBookmark}
//           tooltip="Bookmark"
//         />
//         <Button 
//           icon="pi pi-share-alt" 
//           rounded 
//           text 
//           severity="secondary" 
//           onClick={handleShare}
//           tooltip="Share"
//         />
//       </div>
//     </div>
//   );

//   return (
//     <Card 
//       className="h-full scholarship-card" 
//       footer={footer} 
//       header={header}
//       pt={{
//         content: { className: 'p-3' },
//         body: { className: 'p-0' }
//       }}
//     >
//       <div className="mb-3">
//         <h3 className="text-xl font-bold mb-2 text-primary">{scholarship.title}</h3>
//         <div className="text-lg font-medium text-color-secondary mb-2">{scholarship.organization}</div>
//       </div>
      
//       <div className="flex flex-column gap-2 mb-3">
//         <div className="flex justify-content-between">
//           <span className="font-semibold">Amount:</span>
//           <span className="font-bold text-primary">${scholarship.amount.toLocaleString()}</span>
//         </div>
//         <div className="flex justify-content-between">
//           <span className="font-semibold">Deadline:</span>
//           <span className={`${new Date(scholarship.deadline) < new Date() ? 'text-red-500' : ''}`}>
//             {new Date(scholarship.deadline).toLocaleDateString()}
//           </span>
//         </div>
//         <div className="flex justify-content-between">
//           <span className="font-semibold">Applicants:</span>
//           <span>{scholarship.applicants}</span>
//         </div>
//       </div>
      
//       <p className="mb-3 line-clamp-2">{scholarship.description}</p>
      
//       <div className="mb-3">
//         <div className="font-semibold mb-1">Eligibility:</div>
//         <p className="text-sm line-clamp-2">{scholarship.eligibility}</p>
//       </div>
      
//       <div className="flex flex-wrap gap-2 mb-3">
//         <Tag value={scholarship.fieldOfStudy} severity="info" />
//         <Tag value={scholarship.academicLevel} severity="warning" />
//         <Tag value={scholarship.location} severity="success" />
//       </div>
      
//       <div className="text-xs text-color-secondary overflow-hidden text-overflow-ellipsis">
//         Contract: {scholarship.contractAddress.substring(0, 10)}...
//       </div>
//     </Card>
//   );
// }