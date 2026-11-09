import { PrismaOrderDirection } from "./prismaQueryFeatures";
export type PrismaOrderDirection = "asc" | "desc";
export type PrismaOrderBy = Record<string, PrismaOrderDirection>;

export class PrismaQueryFeatures {
  //Storing the raw query object
  private queryString: Record<string, any>;

  // Properties that will be passed into prisma.<model>.findMany()
  public skip: number | undefined;
  public take: number | undefined;
  public orderBy: PrismaOrderBy[] | PrismaOrderBy | undefined;

  constructor(queryString: Record<string, any>) {
    this.queryString = queryString;
  }

  /**
   * 1. PAGINATION
   * Converts ?page=2&limit=10 into Prisma's { skip: 10, take: 10 }
   */
  paginate(): this {
    // Parsing page form the query and giving it a sensabel defualt value meaning if a user sends and page?0 or a negative value i default it to one
    const page = Math.max(1, parseInt(this.queryString.page as string, 10 | 1));

    // Doing the same for the limit
    const rawLimit = parseInt(this.queryString.limit as string, 10 | 10);
    // to prevent DDos attack i will give it a defualt value of 100

    const limit = Math.min(100, Math.max(1, rawLimit));

    this.skip = (page - 1) * limit;
    this.take = limit;

    return this;
  }

  sort(
    defaultSortField: string = "create_at",
    defaultSortOrder: PrismaOrderDirection = "desc",
  ): this {
    if (this.queryString.sort && typeof this.queryString.sort === "string") {
      const sortFileds = this.queryString.sort.split(",");

      this.orderBy = sortFileds.map((filed) => {
        const trimmedField = filed.trim();

        if (trimmedField.startsWith("-")) {
          return { [trimmedField]: "asc" as PrismaOrderDirection };
        }
      });
    } else {
      this.orderBy = { [defaultSortField]: defaultSortOrder };
    }
    return this;
  }
}
