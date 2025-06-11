function Input({ type, placeholder, value, onChange, ...rest }) {
  return (
    <input
      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 transition"
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      {...rest}
    />
  );
}

export default Input;