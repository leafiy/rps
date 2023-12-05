class QuadtreeNode {
  constructor(boundary, capacity) {
    this.boundary = boundary; // {x, y, width, height}
    this.capacity = capacity;
    this.items = [];
    this.divided = false;
  }

  insert(item) {
    // 如果项目不在边界内，不插入
    if (!this.isWithinBoundary(item)) {
      return false;
    }

    // 如果容量未满，添加到此节点
    if (this.items.length < this.capacity) {
      this.items.push(item);
      return true;
    }

    // 否则，分割并添加到相应的子节点
    if (!this.divided) {
      this.subdivide();
    }

    return (
      this.northeast.insert(item) ||
      this.northwest.insert(item) ||
      this.southeast.insert(item) ||
      this.southwest.insert(item)
    );
  }

  subdivide() {
    const x = this.boundary.x;
    const y = this.boundary.y;
    const w = this.boundary.width / 2;
    const h = this.boundary.height / 2;

    let ne = { x: x + w, y: y, width: w, height: h };
    let nw = { x: x, y: y, width: w, height: h };
    let se = { x: x + w, y: y + h, width: w, height: h };
    let sw = { x: x, y: y + h, width: w, height: h };

    this.northeast = new QuadtreeNode(ne, this.capacity);
    this.northwest = new QuadtreeNode(nw, this.capacity);
    this.southeast = new QuadtreeNode(se, this.capacity);
    this.southwest = new QuadtreeNode(sw, this.capacity);

    this.divided = true;
  }

  query(range, found = []) {
    // 如果范围与此节点的边界不相交，返回空数组
    if (!this.intersects(range, this.boundary)) {
      return found;
    }

    // 检查当前节点中的每个元素，如果它们在范围内，则添加到 found 数组中
    for (let item of this.items) {
      if (this.isWithinRange(item, range)) {
        found.push(item);
      }
    }

    // 如果当前节点已分割，递归查询每个子节点
    if (this.divided) {
      this.northeast.query(range, found);
      this.northwest.query(range, found);
      this.southeast.query(range, found);
      this.southwest.query(range, found);
    }

    return found;
  }

  // 辅助方法：检查两个矩形是否相交
  intersects(range, boundary) {
    return !(
      range.x > boundary.x + boundary.width ||
      range.x + range.width < boundary.x ||
      range.y > boundary.y + boundary.height ||
      range.y + range.height < boundary.y
    );
  }

  // 辅助方法：检查一个元素是否在给定范围内
  isWithinRange(item, range) {
    return (
      item.x >= range.x &&
      item.x <= range.x + range.width &&
      item.y >= range.y &&
      item.y <= range.y + range.height
    );
  }
  isWithinBoundary(item) {
    return (
      item.x >= this.boundary.x &&
      item.x <= this.boundary.x + this.boundary.width &&
      item.y >= this.boundary.y &&
      item.y <= this.boundary.y + this.boundary.height
    );
  }
}

class Quadtree {
  constructor(boundary, capacity) {
    this.root = new QuadtreeNode(boundary, capacity);
  }
  clear() {
    this.root = new QuadtreeNode(this.root.boundary, this.root.capacity);
  }
  insert(item) {
    return this.root.insert(item);
  }

  query(range) {
    return this.root.query(range);
  }
}

export default Quadtree;
