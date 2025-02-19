export abstract class RestEntity {
  public uid!: string;

  public created!: Date;

  public updated!: Date;

  constructor(data?: { [key: string]: any }) {
    if (data) {
      Object.keys(this).forEach((key) => {
        if (data[key] !== undefined) {
          (this as any)[key] = data[key];
        }
      });
    }
  }
}
