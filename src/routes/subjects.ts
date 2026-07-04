import { and, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import express from "express";
import { departments, subjects } from "../db/schema";
import { db } from "../db";

const router = express.Router();

// Define your subject-related routes here get all 
//subjects with optional search,filtering and pagination
router.get("/", async (req, res) => {
    try{
        const { search, department, page = 1, limit = 10 } = req.query;

        const MAX_LIMIT = 100;
        const parsedPage = Number(page);
        const parsedLimit = Number(limit);
        const currentPage = Number.isFinite(parsedPage) ? Math.max(1, Math.trunc(parsedPage)) : 1;
        const limitPerPage = Number.isFinite(parsedLimit)
            ? Math.min(MAX_LIMIT, Math.max(1, Math.trunc(parsedLimit)))
            : 10;
        const offset = (currentPage - 1) * limitPerPage;

        const filterConditions =[];

        //if search query is provided, add it to the filter conditions
        //  subject name or code should match the search term
        if(search){
            filterConditions.push(
                or(
                    ilike(subjects.name, `%${search}%`),
                    ilike(subjects.code, `%${search}%`)
                )
            );
        }

        //if department is provided, add it to the filter conditions
        //  match  the department name

        if(department){
            filterConditions.push(ilike(departments.name, `%${department}%`));
            const deptPattern = `%${String(department).replace(/[%_]/g, '\\$&')}%`;
            filterConditions.push(ilike(departments.name, deptPattern));
        }

        const whereClause = filterConditions.length > 0 ?  and( ... filterConditions)  : undefined;

        const countResult = await 
        db.select({count: sql<number>`count(*)`})
        .from(subjects)
        .leftJoin(departments, eq(subjects.departmentId, departments.id))
        .where(whereClause);

        const totalCount = countResult[0]?.count ?? 0;

        const subjectsList = await db
        .select( {
            ...getTableColumns(subjects),
            department: { ...getTableColumns(departments)}
        })
        .from(subjects)
        .leftJoin(departments, eq(subjects.departmentId, departments.id))
        .where(whereClause)
        .offset(offset)
        .limit(limitPerPage);

        res.status(200).json({
            data: subjectsList,
            pagination: {
                page: currentPage,
                limit: limitPerPage,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitPerPage)
            }
        });
    }
    catch(error){
        console.error("Error fetching subjects:", error);
        res.status(500).json({ error: "Failed to get Subjects" });
    }
});

export default router;
