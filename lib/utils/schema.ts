export default function getSchemaUtils(self: any) {
  return {
    getDefaultCollectionName() {
      return self.getCollectionName?.() || self.getConfig().collectionName.apply(self.constructor);
    },
  };
}
