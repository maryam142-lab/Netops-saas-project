import { motion } from 'framer-motion';

const Card = ({ className = '', children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`surface-card p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card;
