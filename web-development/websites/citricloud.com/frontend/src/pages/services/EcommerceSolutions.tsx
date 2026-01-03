import ServiceTemplate from './ServiceTemplate';
import { FiShoppingCart } from 'react-icons/fi';

export default function EcommerceSolutions() {
  return (
    <ServiceTemplate
      title="E-commerce Solutions"
      subtitle="Complete online store platforms that drive sales"
      description="Launch and grow your online business with our fully-featured e-commerce solutions. From product catalogs to payment processing, we build platforms that convert visitors into customers."
      icon={<FiShoppingCart className="w-7 h-7" />}
      bullets={[
        'Custom shopping cart and checkout flow',
        'Multi-currency and multi-language support',
        'Inventory management and order tracking',
        'Secure payment gateway integration (Stripe, PayPal)',
        'Product recommendations and upselling features',
        'Customer reviews and ratings system',
        'Analytics dashboard and sales reporting',
        'Mobile-optimized responsive design',
      ]}
    />
  );
}
