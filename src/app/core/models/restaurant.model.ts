export interface RestaurantInfo {
  restaurant: {
    name: string;
    slug: string;
    template_id: string;
    phone: string;
    address: string;
    location: {
      lat: number;
      lng: number;
    };
  };
  settings: {
    whatsapp_config: {
      number: string;
      message_template: string;
    };
    display_config: {
      currency: string;
      language: string;
    };
    order_config: {
      enabled: boolean;
      delivery_fee: number;
      pickup_enabled: boolean;
      payment_methods: string[];
      delivery_enabled: boolean;
      max_order_quantity: number;
      accepts_reservations: boolean;
    };
    business_config: {
      social_media: {
        tiktok: string;
        facebook: string;
        instagram: string;
      };
      business_hours: {
        [key: string]: {
          open: string;
          close: string;
          isOpen: boolean;
        };
      };
      delivery_zones: string[];
    };
    description: string;
    tags: string[];
    logo_url: string | null;
  };
}
