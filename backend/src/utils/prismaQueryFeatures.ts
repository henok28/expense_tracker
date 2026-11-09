export type PrismaOrderDirection = "asc" | "desc";
export type PrismaOrderBy = Record<string, PrismaOrderDirection>;

export class PrismaQueryFeatures {
  //Storing the raw query object
  private queryString: Record<string, any>;

  // Properties that will be passed into prisma.<model>.findMany()
  public skip: number | undefined;
  public take: number | undefined;
  public orderBy: PrismaOrderBy[] | PrismaOrderBy | undefined;
  public where: Record<string, any> = {};
  public select: Record<string, boolean> | undefined;

  constructor(queryString: Record<string, any>) {
    this.queryString = queryString;
  }

  /**
   * 1. PAGINATION
   * Converts ?page=2&limit=10 into Prisma's { skip: 10, take: 10 }
   */

  paginate(): this {
    // Parsing page form the query and giving it a sensabel defualt value meaning if a user sends and page?0 or a negative value i default it to one
    const page = Math.max(
      1,
      parseInt(this.queryString.page as string, 10) || 1,
    );

    // Doing the same for the limit
    const rawLimit = parseInt(this.queryString.limit as string, 10) || 10;
    // to prevent DDos attack i will give it a defualt value of 100

    const limit = Math.min(100, Math.max(1, rawLimit));

    this.skip = (page - 1) * limit;
    this.take = limit;

    return this;
  }

  sort(
    defaultSortField: string = "created_at",
    defaultSortOrder: PrismaOrderDirection = "desc",
  ): this {
    if (this.queryString.sort && typeof this.queryString.sort === "string") {
      const sortFileds = this.queryString.sort.split(",");

      this.orderBy = sortFileds.map((filed): PrismaOrderBy => {
        const trimmedField = filed.trim();

        if (trimmedField.startsWith("-")) {
          return { [trimmedField.slice(1)]: "desc" };
        }

        return { [trimmedField]: "asc" };
      });
    } else {
      this.orderBy = { [defaultSortField]: defaultSortOrder };
    }
    return this;
  }

  // Helper Function
  parseFilterValue = (val: any): any => {
    // If it's not a string (e.g. already boolean or number), return it as is
    if (typeof val !== "string") return val;

    // 1) Check if it's a valid integer or float (e.g., "100", "49.99")
    if (!isNaN(Number(val)) && val.trim() !== "") {
      return Number(val);
    }

    // 2) Check if it's an ISO date string (e.g., "2026-11-01" or "2026-11-01T00:00:00.000Z")
    const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
    if (dateRegex.test(val)) {
      const parsedDate = new Date(val);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }

    // 3) Boolean strings ("true" / "false")
    if (val.toLowerCase() === "true") return true;
    if (val.toLowerCase() === "false") return false;

    // Otherwise, return as plain string (e.g., "PENDING", "BUSINESS")
    return val;
  };

  //Woring on fitler
  filter(): this {
    // Making a shallow copy
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];

    excludedFields.forEach((field) => delete queryObj[field]);

    //
    const formattedWhere: Record<string, any> = {};

    for (const [key, value] of Object.entries(queryObj)) {
      // Case A: Nested operators, e.g. amount[gte]=100 => { amount: { gte: "100" } }
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        formattedWhere[key] = {};
        for (const [op, opVal] of Object.entries(value)) {
          // Check if operator is one of gte, gt, lte, lt, equals, contains
          if (["gte", "gt", "lte", "lt", "equals", "not"].includes(op)) {
            formattedWhere[key][op] = this.parseFilterValue(opVal);
          }
        }
      }
      // Case B: Direct equality, e.g. status=APPROVED or categoryId=2
      else {
        formattedWhere[key] = this.parseFilterValue(value);
      }
    }
    this.where = formattedWhere;

    //
    return this;
  }

  /**
   * 4. FIELD LIMITING / SELECTION
   * Converts ?fields=amount,description,status into Prisma's:
   * select: { amount: true, description: true, status: true }
   */
  public limitFields(): this {
    //
    if (
      this.queryString.fields &&
      typeof this.queryString.fields === "string"
    ) {
      const fields = this.queryString.fields.split(",");
      const selectObj: Record<string, boolean> = {};

      fields.forEach((field) => {
        const trimmed = field.trim();
        if (trimmed) {
          selectObj[trimmed] = true;
        }
      });

      this.select = selectObj;
    }
    return this;
  }
}
