// import React from "react";
// import {
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   Button,
// } from "@mui/material";
// import { useForm } from "react-hook-form";

// interface ModalProps {
//   open: boolean;
//   onClose: () => void;
//   title: string;
//   fields: React.ReactNode; // Campos específicos do formulário passados como filhos
//   onSubmit: (data: any) => void;
//   defaultValues?: object;
// }

// export const ModalCreateEdit: React.FC<ModalProps> = ({
//   open,
//   onClose,
//   title,
//   fields,
//   onSubmit,
//   defaultValues = {},
// }) => {
//   const { handleSubmit, register, formState } = useForm({ defaultValues });

//   return (
//     <Dialog open={open} onClose={onClose}>
//       <DialogTitle>{title}</DialogTitle>
//       <DialogContent>
//         <form onSubmit={handleSubmit(onSubmit)}>
//           {fields} {/* Aqui são renderizados os campos específicos */}
//           <DialogActions>
//             <Button onClick={onClose} color="primary">
//               Cancelar
//             </Button>
//             <Button type="submit" color="primary">
//               Salvar
//             </Button>
//           </DialogActions>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// };
