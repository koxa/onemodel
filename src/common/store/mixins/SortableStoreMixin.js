class SortableStoreMixin {
  /**
   * Sorts items in store
   * @param dir Default is True = Asc
   * @param key Object key to sort upon
   * @returns {SortableStoreMixin}
   */
  sort(dir = true, key) {
    //todo: mutate items order
    this.items.sort((a, b) => {
      let aa;
      let bb;
      if (key) {
        aa = a[key];
        bb = b[key];
      } else {
        aa = a;
        bb = b;
      }
      if (aa === undefined && bb === undefined) {
        return 0;
      }
      if (aa > bb) {
        return dir ? 1 : -1;
      } else if (aa < bb) {
        return dir ? -1 : 1;
      }
      return 0;
    });
    return this;
  }
}

export default SortableStoreMixin;
