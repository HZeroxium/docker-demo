import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Typography,
  Button,
} from "@mui/material";
import {
  CalendarToday as CalendarIcon,
  ArrowRight as ArrowRightIcon,
} from "@mui/icons-material";
import Link from "next/link";
import type { BlogPost } from "@/lib/types";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Card>
      <CardHeader
        avatar={<CalendarIcon fontSize="small" />}
        title={
          <Typography variant="caption" color="text.secondary">
            {new Date(post.created_at).toLocaleDateString("vi-VN")}
          </Typography>
        }
        subheader={<Typography variant="h6">{post.title}</Typography>}
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {post.excerpt}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          component={Link}
          href={`/blog/${post.slug}`}
          endIcon={<ArrowRightIcon fontSize="small" />}
        >
          Đọc thêm
        </Button>
      </CardActions>
    </Card>
  );
}
