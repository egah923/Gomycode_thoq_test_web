
const FormCommonCard = ({ children, className }:any) => {
  return (
    <div className={`bg-white p-4 shadow-sm rounded-3 ${className}`}>{children}</div>
  )
}

export default FormCommonCard